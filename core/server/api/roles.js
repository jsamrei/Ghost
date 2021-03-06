// # Roles API
// RESTful API for the Role resource
var Promise         = require('bluebird'),
    canThis         = require('../permissions').canThis,
    dataProvider    = require('../models'),
    errors          = require('../errors'),

    roles;

/**
 * ## Roles API Methods
 *
 * **See:** [API Methods](index.js.html#api%20methods)
 */
roles = {
    /**
     * ### Browse
     * Find all roles
     *
     * If a 'permissions' property is passed in the options object then
     * the results will be filtered based on whether or not the context user has the given
     * permission on a role.
     *
     *
     * @public
     * @param {{context, permissions}} options (optional)
     * @returns {Promise(Roles)} Roles Collection
     */
    browse: function browse(options) {
        options = options || {};

        return canThis(options.context).browse.role().then(function () {
            return dataProvider.Role.findAll(options).then(function (results) {
                var roles = results.map(function (r) {
                    return r.toJSON();
                });

                if (options.permissions !== 'assign') {
                    return {roles: roles};
                }

                return Promise.filter(roles.map(function (role) {
                    return canThis(options.context).assign.role(role)
                    .return(role)
                    .catch(function () {});
                }), function (value) {
                    return value && value.name !== 'Owner';
                }).then(function (roles) {
                    return {roles: roles};
                });
            });
        }).catch(errors.logAndThrowError);
    }
};

module.exports = roles;
