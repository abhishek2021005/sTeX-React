import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfPostOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { isMemberOfAcl } from '../acl-utils/acl-common-utils';
import { checkIfUserAuthorizedForResourceAction } from './resource-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;
  const { aclId, resourceId, actionId } = req.body;
  const userId = await getUserIdOrSetError(req, res);
  if (!aclId || !resourceId || !actionId) res.status(422).send(`Missing params.`);
  if (!(await checkIfUserAuthorizedForResourceAction(res, resourceId, userId)))
    return res.status(403).send('unauthorized');
  const query = `UPDATE ResourceAccess SET aclId = ? WHERE resourceId = ? and actionId = ?`;
  const result = await executeAndEndSet500OnError(query, [aclId, resourceId, actionId], res);
  if (!result) return;
  res.status(200).send({ message: 'updated' });
}
