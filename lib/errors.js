var errors = {};

errors.server = { status: 'error',
                  message: 'A server error occured',
                  code: 'serverError' };

errors.invalidFeed = {  status: 'failure',
                        message: 'A server error occured',
                        code: 'serverError' };

module.exports = errors;