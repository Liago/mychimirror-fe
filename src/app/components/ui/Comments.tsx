import type { CommentNode } from "@/lib/content";
import { getDict, type Locale } from "@/lib/i18n";

import CommentReplyAction from "./CommentReplyAction";
import LeaveCommentForm from "./LeaveCommentForm";

type CommentAuthorNode = CommentNode["author"]["node"];

type TreeNode = CommentNode & { children: TreeNode[] };

type Props = {
  comments: CommentNode[];
  postDatabaseId: number;
  postUri: string;
  lang: Locale;
};

function resolveAuthorName(node: CommentAuthorNode, fallback: string): string {
  return node.username || node.name || fallback;
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
  postUri,
  lang,
}: {
  node: TreeNode;
  depth: number;
  postDatabaseId: number;
  postUri: string;
  lang: Locale;
}) => {
  return (
    <li className="mt-10" style={{ marginLeft: depth * 32 }}>
      <h6 className="font-playfair text-lg font-medium italic leading-7 text-black">
        {resolveAuthorName(node.author.node, getDict(lang).post.anonymous)}
      </h6>
      <div
        className="wp-content mt-1"
        dangerouslySetInnerHTML={{ __html: node.content }}
      />
      <CommentReplyAction
        postDatabaseId={postDatabaseId}
        postUri={postUri}
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
              postUri={postUri}
              lang={lang}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const Comments = ({ comments, postDatabaseId, postUri, lang }: Props) => {
  const tree = buildTree(comments);
  const count = comments.length;

  return (
    <section id="comments" className="mt-[30px]">
      {count > 0 && (
        <>
          <h4 className="font-cinzel text-2xl font-medium leading-7 tracking-[-0.02em] text-black">
            {getDict(lang).post.comments(count)}
          </h4>
          <ul>
            {tree.map((node) => (
              <CommentItem
                key={node.id}
                node={node}
                depth={0}
                postDatabaseId={postDatabaseId}
                postUri={postUri}
                lang={lang}
              />
            ))}
          </ul>
        </>
      )}
      <LeaveCommentForm postDatabaseId={postDatabaseId} postUri={postUri} />
    </section>
  );
};

export default Comments;
