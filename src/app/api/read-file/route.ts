// simple route

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const { filePath, owner, repo } = await request.json();
    console.log("filePath", filePath)
    console.log("owner", owner)
    console.log("repo", repo)

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
        headers: {
            Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_PAT}`,
        },
    });

    console.log("response", response)

    if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 });
    }

    const data = await response.json();

    return NextResponse.json({ content: data.content });
}