import { useState } from "react";
import { useLikesHandlers } from "../../Handles/LikesHandlers";

export const NewLike = ({ publicationId, userID, likesCount, userHasLiked, likeId }) => {
    const { handleCreateLike, handleDeleteLike } = useLikesHandlers();

    const [liked, setLiked] = useState(userHasLiked);
    const [count, setCount] = useState(likesCount);

    const onLikeToggle = async () => {
        try {
            if (liked) {
                if (!likeId) {
                    console.warn("No likeId disponible para eliminar like");
                    return;
                }
                await handleDeleteLike(likeId);
                setCount((c) => c - 1);
                setLiked(false);
            } else {
                await handleCreateLike({ publicacion_id: publicationId, usuario_id: userID });
                setCount((c) => c + 1);
                setLiked(true);
            }
        } catch (error) {
            console.error("Error al cambiar like:", error);
        }
    };

    return (
        <button
            onClick={onLikeToggle}
            style={{
                backgroundColor: liked ? "#0d6efd" : "#2c2c2c",
                color: liked ? "white" : "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
            }}
            aria-pressed={liked}
        >
            👍 {count}
        </button>
    );
};
