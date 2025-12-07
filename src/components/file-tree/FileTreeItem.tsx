import { FileTreeNode, FileTreeItemProps } from './types';

export function FileTreeItem({ node, depth }: FileTreeItemProps) {
  const isFolder = node.type === 'folder';
  const hasChildren = isFolder && node.children && node.children.length > 0;

  return (
    <>
      <div
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-sm transition-colors"
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        {isFolder ? (
          <>
            {hasChildren ? (
              <svg
                className="w-4 h-4 flex-shrink-0 text-zinc-500 dark:text-zinc-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 flex-shrink-0 text-zinc-500 dark:text-zinc-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <svg
              className="w-4 h-4 flex-shrink-0 text-blue-500 dark:text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2h4a1 1 0 011 1v10a1 1 0 01-1 1H2a1 1 0 01-1-1V7a1 1 0 011-1h4V4z" />
            </svg>
          </>
        ) : (
          <svg
            className="w-4 h-4 flex-shrink-0 text-zinc-500 dark:text-zinc-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <span className="text-zinc-700 dark:text-zinc-300 font-mono truncate">
          {node.name}
        </span>
      </div>
      {isFolder && node.isExpanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <FileTreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </>
  );
}
