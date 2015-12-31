var errors = {};

errors.server = { status: 'error',
                  message: 'A server error occured',
                  code: 'serverError' };

errors.invalidFeed = {  status: 'failure',
                        message: 'Feed is not valid',
                        code: 'serverError' };

errors.invalidPost = {  status: 'failure',
                        message: 'Post is not valid',
                        code: 'invalidPost' };

module.exports = errors;