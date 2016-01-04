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

errors.invalidTag = {    status: 'failure',
                        message: 'Invalid tag. Tag must be between 2 and 32 characters.',
                           code: 'invalidTag' };

errors.invalidUserId = {    status: 'failure',
                            message: 'Invalid user ID',
                            code: 'invalidUserId' };

errors.invalidParameters = {    status: 'failure',
                                message: 'Missing or invalid parameters',
                                code: 'invalidParams' };

errors.tagDoesNotExist = {  status: 'failure',
                            message: 'Tag does not exit',
                            code: 'tagDoesNotExist' };

module.exports = errors;