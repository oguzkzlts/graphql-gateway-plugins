import DataLoader from "dataloader"
import { fetchPostsByUserIds } from "../services/post.service"

export function createPostLoader() {
    return new DataLoader<string, any[]>(async (userIds) => {
        return fetchPostsByUserIds(userIds)
    })
}