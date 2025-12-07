"use server";

import Redis from 'ioredis';

export async function getRepos() {
    const response = await fetch("https://api.github.com/user/repos", {
        headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
    });
    const data = await response.json();
    return data;
}

export async function createBranch(owner: string, repo: string, base_branch_sha: string, feature_branch: string){
    // POST /repos/{owner}/{repo}/git/refs
    // Authorization: Bearer <PAT>
    // Content-Type: application/json
    // Body: {"ref": "refs/heads/feature-branch", "sha": "<base_branch_sha>"}

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ref: "refs/heads/feature-branch", sha: "<base_branch_sha>" }),
    });
    const data = await response.json();
    return data;
}

export async function createCommit(owner: string, repo: string, file_path: string, message: string, content: string, sha: string, branch: string){
// PUT /repos/{owner}/{repo}/contents/{file_path}
// Authorization: Bearer <PAT>
// Content-Type: application/json
// Body: {"message": "Update file", "content": "<base64_encoded_content>", "sha": "<file_sha>", "branch": "feature-branch"}

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file_path}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: message, content: content, sha: sha, branch: branch }),
    });
    const data = await response.json();
    return data;
}

export async function createPullRequest(owner: string, repo: string, title: string, head: string, base: string, body: string){

    // POST /repos/{owner}/{repo}/pulls
    // Authorization: Bearer <PAT>
    // Content-Type: application/json
    // Body: {"title": "Update file via AI editor", "head": "feature-branch", "base": "main", "body": "PR description"}

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: title, head: head, base: base, body: body }),
    });
    const data = await response.json();
    return data;
}

export async function saveRepoToRedis(repo:any){

    const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
    });

    await redis.set(`repo:${repo.id}`, JSON.stringify(repo));
    await redis.quit();
}