import React from "react";

const ReadOnlyRow = ({ product, handleDeleteClick, handleRestoreClick }) => {
  const isActive = product.active === "True";

  return (
    <tr>
      <td>{product.id}</td>
      <td>{product.best_learning_rate}</td>
      <td>{product.best_batch_size}</td>
      <td>{product.best_max_epochs}</td>
      <td>{product.best_layer_size}</td>
      <td>{product.best_layers}</td>
      <td>{product.best_dropout_probability}</td>
      <td>{product.active}</td>
      <td>
        <button
          type="button"
          onClick={(event) => handleRestoreClick(product.id)}
          disabled={isActive}
        >
          Restore
        </button>
        <button type="button" onClick={() => handleDeleteClick(product.id)}>
          Delete
        </button>
      </td>
    </tr>
  );
};

export default ReadOnlyRow;
