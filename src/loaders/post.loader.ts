import DataLoader from "dataloader"
import { fetchPostsByUserIds } from "../services/post.service"

export function createPostLoader() {
    return new DataLoader(fetchPostsByUserIds)
}