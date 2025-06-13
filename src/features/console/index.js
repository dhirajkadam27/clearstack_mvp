import './styles.css';
import Logo from '../../assets/images/logo.svg';
import { useEffect, useState } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';

const LOGIN_QUERY = gql`
  query Login($email: String!, $password: String!) {
    account(email: $email, password: $password) {
      account_id
      first_name
      last_name
      email
      projects {
        project_id
        name
      }
    }
  }
`;

const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($account_id: ID!, $name: String!) {
    createProject(account_id: $account_id, name: $name) {
      project_id
      name
    }
  }
`;

function Console() {
  const [projectName, setProjectName] = useState('');
  const [account, setAccount] = useState(null);
  const [projects, setProjects] = useState([]);

  const email = 'dhiraj@gmail.com';
  const password = '1234';

  const [fetchAccount] = useLazyQuery(LOGIN_QUERY, {
    variables: { email, password },
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      const user = data.account[0];
      if (user) {
        setAccount(user);
        setProjects(user.projects || []);
      }
    },
    onError: (err) => {
      alert(err.message || 'Failed to load projects');
    },
  });

  const [createProjectMutation] = useMutation(CREATE_PROJECT_MUTATION, {
    onCompleted: () => {
      setProjectName('');
      fetchAccount(); // Re-fetch projects
    },
    onError: (err) => {
      alert(err.message || 'Failed to create project');
    },
  });

  const createProject = () => {
    if (!projectName.trim() || !account) return;
    createProjectMutation({ variables: { account_id: account.account_id, name: projectName.trim() } });
  };

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  return (
    <div className='console'>
      <div className='nav'>
        <img src={Logo} alt='clearstack logo' />
        <button>{account?.first_name.substring(0,1)}{account?.last_name.substring(0,1)}</button>
      </div>

      <div className='createproject'>
        <input
          type='text'
          placeholder='project name'
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <button onClick={createProject}>create</button>
      </div>

      <div className='projects'>
        {projects.length === 0 ? (
          <p>No projects found</p>
        ) : (
          projects.map((proj) => (
            <div className='project' key={proj.project_id}>
              {proj.name}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Console;
