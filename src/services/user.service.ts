export async function fetchUsers() {
    const res = await fetch("https://jsonplaceholder.typicode.com/users")
    return res.json()
}

export async function fetchUserById(id: string) {
    const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
    return res.json()
}