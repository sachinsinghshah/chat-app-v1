import { useRef, useState } from "react";
import { IoClose, IoCamera, IoTrash } from "react-icons/io5";
import { AiOutlineLogout } from "react-icons/ai";
import useUpdateProfile from "../../hooks/useUpdateProfile";
import useLogout from "../../hooks/useLogout";
import { useAuthContext } from "../../context/AuthContext";
import UserAvatar from "./UserAvatar";

/** Compress & resize an image file to a base64 string (max ~800px, quality 0.8) */
const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ProfileModal = ({ onClose }) => {
  const { authUser } = useAuthContext();
  const { loading, updateProfile } = useUpdateProfile();
  const { logout } = useLogout();
  const fileRef = useRef();

  const [preview, setPreview] = useState(null);
  const [fullName, setFullName] = useState(authUser?.fullName || "");

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const compressed = await compressImage(file);
    setPreview(compressed);
  };

  const handleRemovePic = () => {
    setPreview("remove");
  };

  const handleSave = async () => {
    const payload = {};
    if (fullName.trim() !== authUser?.fullName) payload.fullName = fullName;
    if (preview === "remove") payload.profilePic = "";
    else if (preview) payload.profilePic = preview;

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }
    const result = await updateProfile(payload);
    if (result) onClose();
  };

  const isDefaultPic =
    !authUser?.profilePic ||
    authUser.profilePic.includes("avatar.iran.liara.run");

  const displayPic =
    preview === "remove" ? null : preview || authUser?.profilePic;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <IoClose size={22} />
          </button>
        </div>

        {/* Avatar section */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-indigo-500/40">
              {displayPic && displayPic !== "remove" ? (
                <img
                  src={displayPic}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserAvatar
                  user={{ ...authUser, profilePic: null }}
                  size={96}
                />
              )}
            </div>
            {/* Overlay on hover */}
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <IoCamera size={28} className="text-white" />
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5"
            >
              <IoCamera size={14} /> Upload Photo
            </button>
            {(!isDefaultPic || preview) && preview !== "remove" && (
              <button
                type="button"
                onClick={handleRemovePic}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 transition-colors flex items-center gap-1.5"
              >
                <IoTrash size={14} /> Remove
              </button>
            )}
          </div>
        </div>

        {/* Full name field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Display Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-indigo-500 transition-colors"
            placeholder="Your name"
          />
        </div>

        {/* Username (readonly) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Username
          </label>
          <input
            type="text"
            value={authUser?.username || ""}
            readOnly
            className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-400 text-sm outline-none cursor-not-allowed"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="loading loading-spinner w-4 h-4" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors pt-1 border-t border-gray-700"
        >
          <AiOutlineLogout size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
