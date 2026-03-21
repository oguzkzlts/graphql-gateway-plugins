export async function fetchPosts() {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts")
    return res.json()
}

export async function fetchPostsByUserIds(userIds: readonly string[]) {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts")
    const posts = await res.json()

    return userIds.map(userId =>
        posts.filter((p: any) => String(p.userId) === String(userId))
    )
}