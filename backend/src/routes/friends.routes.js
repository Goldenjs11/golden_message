import { Router } from 'express';
import {
    searchUsers,
    sendFriendRequest,
    respondFriendRequest,
    getFriends,
    getPendingRequests
} from '../controllers/friends.controller.js';

const router = Router();

router.get('/search', searchUsers);
router.post('/request', sendFriendRequest);
router.put('/request/:id', respondFriendRequest);
router.get('/:userId', getFriends);
router.get('/pending/:userId', getPendingRequests);

export default router;