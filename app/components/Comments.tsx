import { Form, useLoaderData, useOutletContext } from 'react-router';
import type { User } from 'lucia';

type Comment = {
  id: number;
  content: string;
  createdAt: string;
  author: string;
};

export default function Comments() {
  const { slug, comments } = useLoaderData() as { slug: string; comments: Comment[] };
  const { user } = useOutletContext() as { user: User | null };

  return (
    <section className="bg-gray-100 p-4">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-xl font-bold mb-4">Comments</h2>
        {user ? (
          <Form method="post" action={`/api/articles/${slug}/comments`}>
            <textarea
              name="content"
              className="w-full p-2 border border-gray-300 rounded"
              rows={3}
              placeholder="Add a comment"
            ></textarea>
            <button
              type="submit"
              className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Submit
            </button>
          </Form>
        ) : (
          <p>
            <a href="/login" className="text-blue-500">
              Log in
            </a>{' '}
            to post a comment.
          </p>
        )}
        <div className="mt-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white p-4 rounded shadow mb-4">
              <p className="text-gray-800">{comment.content}</p>
              <div className="text-sm text-gray-600">
                <span>{comment.author}</span> &middot;{' '}
                <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
