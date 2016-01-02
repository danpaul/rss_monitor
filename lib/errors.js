var errors = {};

errors.server = { status: 'error',
                  message: 'A server error occured',
                  code: 'serverError' };

errors.invalidFeed = {  status: 'failure',
                        message: 'Feed is not valid',
                        code: 'serverFeed' };

errors.invalidPost = {  status: 'failure',
                        message: 'Post is not valid',
                        code: 'invalidPost' };

errors.invalidFeed = {  status: 'failure',
                        message: 'Unable to add feed. Feed may not be valid.',
                        code: 'invalidFeed' };

errors.invalidParameters = {    status: 'failure',
                                message: 'Missing or invalid parameters',
                                code: 'invalidParams' };

module.exports = errors;