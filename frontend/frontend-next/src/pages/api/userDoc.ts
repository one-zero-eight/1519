import { NextApiRequest, NextApiResponse } from 'next';
import { dbUserUpdate } from '@/utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const [user_id, doc_id, { seen, comment }] = req.body;
    await dbUserUpdate(user_id, (user) => {
        user.docs[doc_id] = { seen, comment };
    });

    res.status(200).json({ message: 'Document updated successfully' });
}