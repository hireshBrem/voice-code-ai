export type FileTreeNodeType = 'file' | 'folder';

export interface FileTreeNode {
  id: string;
  name: string;
  type: FileTreeNodeType;
  children?: FileTreeNode[];
  isExpanded?: boolean;
}

export interface FileTreeProps {
  className?: string;
}

export interface FileTreeItemProps {
  node: FileTreeNode;
  depth: number;
}
