import './styles.css';
import Logo from '../../assets/images/logo.svg';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';

const GET_ACCOUNT_DATA = gql`
  query GetAccount($email: String!, $password: String!) {
    account(email: $email, password: $password) {
      account_id
      first_name
      projects {
        project_id
        name
        tables {
          project_id
          name
          header {
            Field
            Type
            Null
            Key
            Default
            Extra
          }
          row
        }
      }
    }
  }
`;

const CREATE_TABLE = gql`
  mutation CreateTable($project_id: ID!, $tableName: String!, $columns: [ColumnInput!]!) {
    createTable(project_id: $project_id, tableName: $tableName, columns: $columns)
  }
`;

const INSERT_ROW = gql`
  mutation InsertRow($project_id: ID!, $tableName: String!, $row: JSON!) {
    insertRow(project_id: $project_id, tableName: $tableName, row: $row)
  }
`;

const UPDATE_ROW = gql`
  mutation UpdateRow($project_id: ID!, $tableName: String!, $condition: JSON!, $newData: JSON!) {
    updateRow(project_id: $project_id, tableName: $tableName, condition: $condition, newData: $newData)
  }
`;

const DELETE_ROW = gql`
  mutation DeleteRow($project_id: ID!, $tableName: String!, $condition: JSON!) {
    deleteRow(project_id: $project_id, tableName: $tableName, condition: $condition)
  }
`;

const ADD_COLUMN = gql`
  mutation AddColumn($project_id: ID!, $tableName: String!, $column: ColumnInput!) {
    addColumn(project_id: $project_id, tableName: $tableName, column: $column)
  }
`;

const UPDATE_COLUMN = gql`
  mutation UpdateColumn($project_id: ID!, $tableName: String!, $columnName: String!, $newColumn: ColumnInput!) {
    updateColumn(project_id: $project_id, tableName: $tableName, columnName: $columnName, newColumn: $newColumn)
  }
`;

const DELETE_COLUMN = gql`
  mutation DeleteColumn($project_id: ID!, $tableName: String!, $columnName: String!) {
    deleteColumn(project_id: $project_id, tableName: $tableName, columnName: $columnName)
  }
`;

function Studio() {
  const { data, loading, error, refetch } = useQuery(GET_ACCOUNT_DATA, {
    variables: {
      email: 'dhiraj@gmail.com',
      password: '1234'
    }
  });

  // Mutations
  const [createTable] = useMutation(CREATE_TABLE);
  const [insertRow] = useMutation(INSERT_ROW);
  const [updateRow] = useMutation(UPDATE_ROW);
  const [deleteRow] = useMutation(DELETE_ROW);
  const [addColumn] = useMutation(ADD_COLUMN);
  const [updateColumn] = useMutation(UPDATE_COLUMN);
  const [deleteColumn] = useMutation(DELETE_COLUMN);

  // State for creating new table
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState([
    { Field: '', Type: '', Null: 'NO', Key: '', Default: '', Extra: '' }
  ]);

  // State for table editor
  const [selectedTable, setSelectedTable] = useState(null);
  const [showAddRowForm, setShowAddRowForm] = useState(false);
  const [showAddColumnForm, setShowAddColumnForm] = useState(false);
  const [newRowData, setNewRowData] = useState({});
  const [newColumn, setNewColumn] = useState({ Field: '', Type: '', Null: 'NO', Key: '', Default: '', Extra: '' });
  const [editingRow, setEditingRow] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const account = data.account[0];
  const project = account.projects?.[0];
  const tables = project?.tables || [];

  // Handle column changes for new table creation
  const handleColumnChange = (index, field, value) => {
    const updated = [...columns];
    updated[index][field] = value;
    setColumns(updated);
  };

  const addColumnToNewTable = () => {
    setColumns([...columns, { Field: '', Type: '', Null: 'NO', Key: '', Default: '', Extra: '' }]);
  };

  const removeColumnFromNewTable = (index) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  // Handle table creation
  const handleCreateTable = async (e) => {
    e.preventDefault();
    try {
      await createTable({
        variables: {
          project_id: project.project_id,
          tableName,
          columns,
        }
      });
      alert('Table created successfully!');
      setTableName('');
      setColumns([{ Field: '', Type: '', Null: 'NO', Key: '', Default: '', Extra: '' }]);
      refetch();
    } catch (err) {
      console.error(err);
      alert('Failed to create table: ' + err.message);
    }
  };

  // Handle table selection
  const handleTableSelect = (table) => {
    setSelectedTable(table);
    setShowAddRowForm(false);
    setShowAddColumnForm(false);
    setEditingRow(null);
    setEditingColumn(null);
  };

  // Handle adding new row
  const handleAddRow = async (e) => {
    e.preventDefault();
    try {
      await insertRow({
        variables: {
          project_id: selectedTable.project_id,
          tableName: selectedTable.name,
          row: newRowData
        }
      });
      alert('Row added successfully!');
      setNewRowData({});
      setShowAddRowForm(false);
      refetch();
    } catch (err) {
      alert('Failed to add row: ' + err.message);
    }
  };

  // Handle updating row
  const handleUpdateRow = async (originalRow) => {
    try {
      await updateRow({
        variables: {
          project_id: selectedTable.project_id,
          tableName: selectedTable.name,
          condition: originalRow,
          newData: editingRow
        }
      });
      alert('Row updated successfully!');
      setEditingRow(null);
      refetch();
    } catch (err) {
      alert('Failed to update row: ' + err.message);
    }
  };

  // Handle deleting row
  const handleDeleteRow = async (row) => {
      try {
        await deleteRow({
          variables: {
            project_id: selectedTable.project_id,
            tableName: selectedTable.name,
            condition: row
          }
        });
        alert('Row deleted successfully!');
        refetch();
      } catch (err) {
        alert('Failed to delete row: ' + err.message);
      }
  };

  // Handle adding new column
  const handleAddColumn = async (e) => {
    e.preventDefault();
    try {
      await addColumn({
        variables: {
          project_id: selectedTable.project_id,
          tableName: selectedTable.name,
          column: newColumn
        }
      });
      alert('Column added successfully!');
      setNewColumn({ Field: '', Type: '', Null: 'NO', Key: '', Default: '', Extra: '' });
      setShowAddColumnForm(false);
      refetch();
    } catch (err) {
      alert('Failed to add column: ' + err.message);
    }
  };

  // Handle updating column
  const handleUpdateColumn = async (originalColumnName) => {
    try {
      await updateColumn({
        variables: {
          project_id: selectedTable.project_id,
          tableName: selectedTable.name,
          columnName: originalColumnName,
          newColumn: editingColumn
        }
      });
      alert('Column updated successfully!');
      setEditingColumn(null);
      refetch();
    } catch (err) {
      alert('Failed to update column: ' + err.message);
    }
  };

  // Handle deleting column
  const handleDeleteColumn = async (columnName) => {
      try {
        await deleteColumn({
          variables: {
            project_id: selectedTable.project_id,
            tableName: selectedTable.name,
            columnName: columnName
          }
        });
        alert('Column deleted successfully!');
        refetch();
      } catch (err) {
        alert('Failed to delete column: ' + err.message);
      }
  };

  return (
    <div className='studio'>
      <div className='nav'>
        <img src={Logo} alt='clearstack logo' />
        <button>{account.first_name}</button>
      </div>

      <div className='main'>
        <div className='tables'>
          <h3>Existing Tables</h3>
          {tables.map((table, index) => (
            <button 
              key={index} 
              onClick={() => handleTableSelect(table)}
              className={selectedTable?.name === table.name ? 'active' : ''}
            >
              {table.name}
            </button>
          ))}
        </div>

        {/* Table Editor */}
        {selectedTable && (
          <div className='table-editor'>
            <h3>Table: {selectedTable.name}</h3>
            
            {/* Column Management */}
            <div className='column-management'>
              <h4>Columns</h4>
              <button onClick={() => setShowAddColumnForm(!showAddColumnForm)}>
                {showAddColumnForm ? 'Cancel' : 'Add Column'}
              </button>
              
              {showAddColumnForm && (
                <form onSubmit={handleAddColumn} className='add-column-form'>
                  <input
                    type='text'
                    placeholder='Field Name'
                    value={newColumn.Field}
                    onChange={(e) => setNewColumn({...newColumn, Field: e.target.value})}
                    required
                  />
                  <input
                    type='text'
                    placeholder='Type (e.g., VARCHAR(255))'
                    value={newColumn.Type}
                    onChange={(e) => setNewColumn({...newColumn, Type: e.target.value})}
                    required
                  />
                  <select
                    value={newColumn.Null}
                    onChange={(e) => setNewColumn({...newColumn, Null: e.target.value})}
                  >
                    <option value='NO'>NOT NULL</option>
                    <option value='YES'>NULL</option>
                  </select>
                  <select
                    value={newColumn.Key}
                    onChange={(e) => setNewColumn({...newColumn, Key: e.target.value})}
                  >
                    <option value=''>None</option>
                    <option value='PRI'>Primary Key</option>
                    <option value='UNI'>Unique</option>
                  </select>
                  <input
                    type='text'
                    placeholder='Default'
                    value={newColumn.Default}
                    onChange={(e) => setNewColumn({...newColumn, Default: e.target.value})}
                  />
                  <input
                    type='text'
                    placeholder='Extra'
                    value={newColumn.Extra}
                    onChange={(e) => setNewColumn({...newColumn, Extra: e.target.value})}
                  />
                  <button type='submit'>Add Column</button>
                </form>
              )}
            </div>

            {/* Table Structure */}
            <div className='table-structure'>
              <h4>Table Structure</h4>
              <table className='structure-table'>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Type</th>
                    <th>Null</th>
                    <th>Key</th>
                    <th>Default</th>
                    <th>Extra</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTable.header.map((col, index) => (
                    <tr key={index}>
                      {editingColumn && editingColumn.originalField === col.Field ? (
                        <>
                          <td>
                            <input
                              type='text'
                              value={editingColumn.Field}
                              onChange={(e) => setEditingColumn({...editingColumn, Field: e.target.value})}
                            />
                          </td>
                          <td>
                            <input
                              type='text'
                              value={editingColumn.Type}
                              onChange={(e) => setEditingColumn({...editingColumn, Type: e.target.value})}
                            />
                          </td>
                          <td>
                            <select
                              value={editingColumn.Null}
                              onChange={(e) => setEditingColumn({...editingColumn, Null: e.target.value})}
                            >
                              <option value='NO'>NOT NULL</option>
                              <option value='YES'>NULL</option>
                            </select>
                          </td>
                          <td>
                            <select
                              value={editingColumn.Key}
                              onChange={(e) => setEditingColumn({...editingColumn, Key: e.target.value})}
                            >
                              <option value=''>None</option>
                              <option value='PRI'>Primary Key</option>
                              <option value='UNI'>Unique</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type='text'
                              value={editingColumn.Default}
                              onChange={(e) => setEditingColumn({...editingColumn, Default: e.target.value})}
                            />
                          </td>
                          <td>
                            <input
                              type='text'
                              value={editingColumn.Extra}
                              onChange={(e) => setEditingColumn({...editingColumn, Extra: e.target.value})}
                            />
                          </td>
                          <td>
                            <button onClick={() => handleUpdateColumn(col.Field)}>Save</button>
                            <button onClick={() => setEditingColumn(null)}>Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{col.Field}</td>
                          <td>{col.Type}</td>
                          <td>{col.Null}</td>
                          <td>{col.Key}</td>
                          <td>{col.Default}</td>
                          <td>{col.Extra}</td>
                          <td>
                            <button onClick={() => setEditingColumn({...col, originalField: col.Field})}>Edit</button>
                            <button onClick={() => handleDeleteColumn(col.Field)}>Delete</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Row Management */}
            <div className='row-management'>
              <h4>Table Data</h4>
              <button onClick={() => setShowAddRowForm(!showAddRowForm)}>
                {showAddRowForm ? 'Cancel' : 'Add Row'}
              </button>
              
              {showAddRowForm && (
                <form onSubmit={handleAddRow} className='add-row-form'>
                  {selectedTable.header.map((col, index) => (
                    <div key={index}>
                      <label>{col.Field}:</label>
                      <input
                        type='text'
                        placeholder={`Enter ${col.Field}`}
                        value={newRowData[col.Field] || ''}
                        onChange={(e) => setNewRowData({...newRowData, [col.Field]: e.target.value})}
                      />
                    </div>
                  ))}
                  <button type='submit'>Add Row</button>
                </form>
              )}
            </div>

            {/* Table Data */}
            <div className='table-data'>
              <table className='data-table'>
                <thead>
                  <tr>
                    {selectedTable.header.map((col, index) => (
                      <th key={index}>{col.Field}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTable.row.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {selectedTable.header.map((col, colIndex) => (
                        <td key={colIndex}>
                          {editingRow && JSON.stringify(editingRow.original) === JSON.stringify(row) ? (
                            <input
                              type='text'
                              value={editingRow.data[col.Field] || ''}
                              onChange={(e) => setEditingRow({
                                ...editingRow, 
                                data: {...editingRow.data, [col.Field]: e.target.value}
                              })}
                            />
                          ) : (
                            row[col.Field]
                          )}
                        </td>
                      ))}
                      <td>
                        {editingRow && JSON.stringify(editingRow.original) === JSON.stringify(row) ? (
                          <>
                            <button onClick={() => handleUpdateRow(row)}>Save</button>
                            <button onClick={() => setEditingRow(null)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setEditingRow({original: row, data: {...row}})}>Edit</button>
                            <button onClick={() => handleDeleteRow(row)}>Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create New Table Form */}
        <div className='create-table-form'>
          <h3>Create New Table</h3>
          <form onSubmit={handleCreateTable}>
            <input
              type='text'
              placeholder='Table Name'
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              required
            />

            {columns.map((col, index) => (
              <div key={index} className='column-row'>
                <input
                  type='text'
                  placeholder='Field'
                  value={col.Field}
                  onChange={(e) => handleColumnChange(index, 'Field', e.target.value)}
                  required
                />
                <input
                  type='text'
                  placeholder='Type (e.g., VARCHAR(255))'
                  value={col.Type}
                  onChange={(e) => handleColumnChange(index, 'Type', e.target.value)}
                  required
                />
                <select
                  value={col.Null}
                  onChange={(e) => handleColumnChange(index, 'Null', e.target.value)}
                >
                  <option value='NO'>NOT NULL</option>
                  <option value='YES'>NULL</option>
                </select>
                <select
                  value={col.Key}
                  onChange={(e) => handleColumnChange(index, 'Key', e.target.value)}
                >
                  <option value=''>None</option>
                  <option value='PRI'>Primary Key</option>
                  <option value='UNI'>Unique</option>
                </select>
                <input
                  type='text'
                  placeholder='Default'
                  value={col.Default}
                  onChange={(e) => handleColumnChange(index, 'Default', e.target.value)}
                />
                <input
                  type='text'
                  placeholder='Extra (e.g., AUTO_INCREMENT)'
                  value={col.Extra}
                  onChange={(e) => handleColumnChange(index, 'Extra', e.target.value)}
                />
                <button type='button' onClick={() => removeColumnFromNewTable(index)}>Remove</button>
              </div>
            ))}

            <button type='button' onClick={addColumnToNewTable}>Add Column</button>
            <button type='submit'>Create Table</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Studio;