import MessageContainer from "../../components/messages/MessageContainer";
import Sidebar from "../../components/sidebar/Sidebar";
import useConversation from "../../../zustand/useConversation";

const Home = () => {
  const { selectedConversation } = useConversation();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar: full-width on mobile when no chat open, fixed width on desktop */}
      <div
        className={`
          ${selectedConversation ? "hidden md:flex" : "flex"}
          w-full md:w-72 md:min-w-[240px] flex-col
        `}
      >
        <Sidebar />
      </div>

      {/* Message area: hidden on mobile when no chat open */}
      <div
        className={`
          ${!selectedConversation ? "hidden md:flex" : "flex"}
          flex-1 flex-col min-w-0
        `}
      >
        <MessageContainer />
      </div>
    </div>
  );
};

export default Home;
