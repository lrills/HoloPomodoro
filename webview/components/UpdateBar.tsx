import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

type UpdateBarProp = {
  disabled: boolean;
  handleCancel: () => void;
  handleUpdate: () => void;
};

const UpdateBar = ({ disabled, handleCancel, handleUpdate }: UpdateBarProp) => {
  return (
    <AppBar position="sticky" color="default" sx={{ top: 'auto', bottom: 0 }}>
      <Toolbar>
        <Button
          sx={{ flexGrow: 2 }}
          variant="outlined"
          color="error"
          size="large"
          disabled={disabled}
          onClick={handleCancel}
        >
          Cancel
        </Button>

        <Box sx={{ flexGrow: 1 }} />
        <Button
          sx={{ flexGrow: 3 }}
          variant="contained"
          size="large"
          disabled={disabled}
          onClick={() => {
            handleUpdate();
          }}
        >
          Update
        </Button>
      </Toolbar>
    </AppBar>
  );
};
export default UpdateBar;
