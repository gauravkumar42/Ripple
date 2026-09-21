import { Link } from "react-router-dom";
import { Card, Button } from "react-bootstrap";

function timeAgo(dateString) {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    const units = [
        ["year", 31536000],
        ["month", 2592000],
        ["day", 86400],
        ["hour", 3600],
        ["minute", 60],
    ];
    for (const [name, secs] of units) {
        const value = Math.floor(seconds / secs);
        if (value >= 1) return `${value}${name[0]}`;
    }
    return "now";
}

export default function PostCard({ post, onToggleLike }) {
    return (
        <Card className="mb-3 shadow-sm">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                    <Link to={`/posts/${post.id}`} className="fw-semibold text-decoration-none">
                        @{post.username}
                    </Link>
                    <small className="text-muted">{timeAgo(post.created_at)}</small>
                </div>
                <Card.Text as={Link} to={`/posts/${post.id}`} className="d-block mt-2 mb-3 text-body text-decoration-none">
                    {post.content}
                </Card.Text>
                <div className="d-flex gap-3 align-items-center">
                    <Button
                        size="sm"
                        variant={post.liked_by_me ? "primary" : "outline-primary"}
                        onClick={() => onToggleLike(post.id)}
                    >
                        {post.liked_by_me ? "Liked" : "Like"} · {post.like_count}
                    </Button>
                    <Link to={`/posts/${post.id}`} className="small text-muted text-decoration-none">
                        {post.comment_count} comment{post.comment_count === 1 ? "" : "s"}
                    </Link>
                </div>
            </Card.Body>
        </Card>
    );
}
