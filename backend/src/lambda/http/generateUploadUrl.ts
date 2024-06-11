import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils';
import { createLogger } from "../../utils/logger";

const logger = createLogger('uploadFile');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event);

    try {
      const presignedUrl = await createAttachmentPresignedUrl(userId, todoId);

      return {
        statusCode: 201,
        headers: {
          "Access-Control-Allow-Origin": "*", // Required for CORS support to work
          "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
        },
        body: JSON.stringify({ uploadUrl: presignedUrl, })
      }
    }
    catch (e) {
      logger.error('Error create presigned url', e);
      return { statusCode: 500, body: 'Internal Server Error', };
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(cors({ credentials: true })
  )
