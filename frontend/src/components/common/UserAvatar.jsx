import Avatar from "boring-avatars";

const PALETTE = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

/**
 * Renders an uploaded profile picture if one exists,
 * otherwise falls back to a generated boring-avatar.
 *
 * @param {object} user   - object with { fullName, username, profilePic }
 * @param {number} size   - diameter in px
 * @param {string} className - extra class names for the wrapper
 */
const UserAvatar = ({ user, size = 40, className = "" }) => {
  const isDefaultPic =
    !user?.profilePic ||
    user.profilePic.includes("avatar.iran.liara.run");

  const name =
    user?.fullName || user?.username || "User";

  if (!isDefaultPic) {
    return (
      <img
        src={user.profilePic}
        alt={name}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          display: "block",
        }}
      />
    );
  }

  return (
    <div className={className} style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", display: "block" }}>
      <Avatar
        size={size}
        name={name}
        variant="beam"
        colors={PALETTE}
      />
    </div>
  );
};

export default UserAvatar;
