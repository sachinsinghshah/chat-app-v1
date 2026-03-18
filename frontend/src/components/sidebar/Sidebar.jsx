import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";
import SearchInput from "./SearchInput";
import AIBotEntry from "./AIBotEntry";

const Sidebar = () => {
  return (
    <div className="border-r border-slate-500 p-4 flex flex-col">
      <SearchInput />
      <div className="divider px-3"></div>
      {/* AI Assistant always at top */}
      <AIBotEntry />
      <div className="divider px-3 my-1"></div>
      <Conversations />
      <LogoutButton />
    </div>
  );
};

export default Sidebar;
