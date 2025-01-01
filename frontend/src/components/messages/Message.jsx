const Message = () => {
  return (
    <div className="chat chat-end">
      <div className="chat-image avatar">
        <div className=" w-10 rounded-full">
          <img
            alt="Tailwind css chat bubble component"
            src="https://i.pinimg.com/originals/89/bb/3c/89bb3cab09b42ca1a1a2603d4274c74e.png"
          />
        </div>
      </div>
      <div className="chat-bubble text-white bg-blue-500"> Hi babe</div>
      <div className="chat-footer opacity-50 text-xs flex gap-1 items-center">
        10:45
      </div>
    </div>
  );
};

export default Message;
