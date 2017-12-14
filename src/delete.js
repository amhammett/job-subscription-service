'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const allowCidr = process.env.ALLOW_CIDR || 'x.x.x.x'

module.exports.delete = (event, context, callback) => {
  var found = false;

  allowCidr.split(' ').forEach(function(allow_mask) {
    if(event['requestContext']['identity']['sourceIp'].includes(allow_mask)) {
      found = true
    }
  });

  if(!found) {
    console.error('Requestor not in allow list')

    callback(null, {
      statusCode: 403,
      headers: { 'Content-Type': 'text/plain' },
      body: '¯\\_(ツ)_/¯',
    });

    return;
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
  };

  dynamoDb.delete(params, (error) => {
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t remove the record item.',
      });
      return;
    }

    const response = {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({}),
    };
    callback(null, response);
  });
};
