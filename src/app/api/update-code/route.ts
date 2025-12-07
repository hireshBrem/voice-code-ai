import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const { filePath, newCode } = await request.json();
    // const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
    //     headers: {
    //         Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_PAT}`,
    //     },
    // });

    // const data = await response.json();
    // return NextResponse.json(data);
}