const GenderCheckbox = () => {
  return (
    <div className="flex">
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Male</span>
          <input
            type="checkbox"
            defaultChecked
            className="checkbox checkbox-primary"
          />
        </label>
      </div>
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Female</span>
          <input
            type="checkbox"
            defaultChecked
            className="checkbox checkbox-primary"
          />
        </label>
      </div>
    </div>
  );
};

export default GenderCheckbox;

// const GenderCheckbox = () => {
//     return (
//       <div className="flex">
//         <div className="form-control">
//           <label className="label cursor-pointer">
//             <span className="label-text">Male</span>
//             <input
//               type="checkbox"
//               defaultChecked
//               className="checkbox checkbox-primary"
//             />
//           </label>
//         </div>
//         <div className="form-control">
//           <label className="label cursor-pointer">
//             <span className="label-text">Female</span>
//             <input
//               type="checkbox"
//               defaultChecked
//               className="checkbox checkbox-primary"
//             />
//           </label>
//         </div>
//       </div>
//     );
//   };

//   export default GenderCheckbox;
