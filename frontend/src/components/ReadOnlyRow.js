import React from "react";

const ReadOnlyRow = ({
  product,
  handleDeleteClick,
  handleRestoreClick,
  handleArchiveClick,
}) => {
  const isActive = product.active === "True";

  return (
    <tr>
      <td>{product.user_id}</td>
      <td>{product.n_customers}</td>
      <td>{product.n_terminals}</td>
      <td>{product.nb_days}</td>
      <td>{product.start_date}</td>
      <td>{product.radius}</td>
      <td>{product.total_rows}</td>
      <td>{product.fraud_percentage}</td>
      <td>{product.scenario_1}</td>
      <td>{product.scenario_2}</td>
      <td>{product.scenario_3}</td>
      <td>{product.scenario_4}</td>
      <td>{product.scenario_5}</td>
      <td>{product.scenario_6}</td>
      <td>{product.active}</td>
      <td>
        <button
          type="button"
          onClick={(event) => handleRestoreClick(product.user_id)}
          disabled={isActive}
        >
          Restore
        </button>
        <button
          type="button"
          onClick={() => handleDeleteClick(product.user_id)}
        >
          Delete
        </button>
        <button
          type="button"
          onClick={() => handleArchiveClick(product.user_id)}
        >
          Archive
        </button>
      </td>
    </tr>
  );
};

export default ReadOnlyRow;
