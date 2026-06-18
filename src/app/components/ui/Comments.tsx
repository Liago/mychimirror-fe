import { cinzel, cormorantGaramond } from "@/assets/fonts";
import CommentReplyAction from "./CommentReplyAction";
import LeaveCommentForm from "./LeaveCommentForm";

type CommentAuthorNode = {
  name?: string | null;
  username?: string | null;
};

type CommentNode = {
  id: string;
  databaseId: number;
  parentDatabaseId: number | null;
  date: string;
  content: string;
  author: {
    node: CommentAuthorNode;
  };
};

type TreeNode = CommentNode & { children: TreeNode[] };

type Props = {
  comments: CommentNode[];
  postDatabaseId: number;
  postSlug: string;
};

function resolveAuthorName(node: CommentAuthorNode): string {
  return node.username || node.name || "Anonimo";
}

function buildTree(comments: CommentNode[]): TreeNode[] {
  const map = new Map<number, TreeNode>();
  comments.forEach((c) => map.set(c.databaseId, { ...c, children: [] }));

  const roots: TreeNode[] = [];
  map.forEach((node) => {
    const parentId = node.parentDatabaseId;
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

const CommentItem = ({
  node,
  depth,
  postDatabaseId,
  postSlug,
}: {
  node: TreeNode;
  depth: number;
  postDatabaseId: number;
  postSlug: string;
}) => {
  const isReply = depth > 0;
  return (
    <li
      className={`${isReply ? "mt-6" : "mt-8 border-t border-fake-black/20 pt-6"}`}
      style={{ marginLeft: depth * 32 }}
    >
      <p className={`${cinzel.className} text-xl text-fake-black`}>
        {resolveAuthorName(node.author.node)}
      </p>
      <div
        className={`${cormorantGaramond.className} text-lg text-fake-black mt-2`}
        dangerouslySetInnerHTML={{ __html: node.content }}
      />
      <CommentReplyAction
        postDatabaseId={postDatabaseId}
        postSlug={postSlug}
        parentId={node.id}
      />
      {node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <CommentItem
              key={child.id}
              node={child}
              depth={depth + 1}
              postDatabaseId={postDatabaseId}
              postSlug={postSlug}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const Comments = ({ comments, postDatabaseId, postSlug }: Props) => {
  const tree = buildTree(comments);
  const count = comments.length;

  return (
    <section className="mt-10">
      <h2 className={`${cinzel.className} text-3xl text-fake-black`}>
        Comments ({count})
      </h2>
      {count === 0 ? null : (
        <ul>
          {tree.map((node) => (
            <CommentItem
              key={node.id}
              node={node}
              depth={0}
              postDatabaseId={postDatabaseId}
              postSlug={postSlug}
            />
          ))}
        </ul>
      )}
      <LeaveCommentForm
        postDatabaseId={postDatabaseId}
        postSlug={postSlug}
      />
    </section>
  );
};

export default Comments;
