import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Radio from '@mui/material/Radio';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import vtubers from '../../vtubers.json';
import getVtuber from '../utils/getVtuber';
import { VtuberData } from '../types';

type VtuberListItemProps = {
  selected: boolean;
  disabled: boolean;
  vtuber: VtuberData;
  selectType?: 'checkbox' | 'radio';
  handleChange: (id: string, changing: boolean) => void;
  handleDetailsClick: (e: React.MouseEvent) => void;
};

const VtuberListItem = ({
  selected,
  disabled,
  vtuber,
  selectType,
  handleChange,
  handleDetailsClick,
}: VtuberListItemProps) => {
  const labelId = `checkbox-label-${vtuber.id}`;

  return (
    <ListItem
      selected={selected}
      disabled={disabled}
      secondaryAction={
        <IconButton
          disabled={false}
          aria-label={`more-${vtuber.id}`}
          onClick={(event) => {
            handleDetailsClick(event);
            event.stopPropagation();
          }}
        >
          <MoreHorizIcon />
        </IconButton>
      }
      disablePadding
    >
      <ListItemButton
        role={undefined}
        onClick={() => {
          handleChange(vtuber.id, !selected);
        }}
        dense
      >
        {selectType === 'radio' ? (
          <ListItemIcon>
            <Radio
              edge="start"
              checked={selected}
              tabIndex={-1}
              disableRipple
              inputProps={{ 'aria-labelledby': labelId }}
            />
          </ListItemIcon>
        ) : selectType === 'checkbox' ? (
          <ListItemIcon>
            <Checkbox
              edge="start"
              checked={selected}
              tabIndex={-1}
              disableRipple
              inputProps={{ 'aria-labelledby': labelId }}
            />
          </ListItemIcon>
        ) : null}

        <ListItemAvatar>
          <Avatar alt={vtuber.englishName} src={vtuber.photo} />
        </ListItemAvatar>
        <ListItemText
          id={labelId}
          primary={vtuber.name}
          secondary={vtuber.englishName}
        />
      </ListItemButton>
    </ListItem>
  );
};

type VtuberMenuProp = {
  selectType?: 'checkbox' | 'radio';
  selected: Set<string>;
  disabled: boolean;
  handleChange: (id: string, changing: boolean) => void;
  oshi: undefined |null| string;
};

const VtuberMenu = ({
  oshi,
  selected,
  disabled,
  handleChange,
  selectType,
}: VtuberMenuProp) => {
  const [detailsMenu, setDetailsMenu] = React.useState<
    [any, VtuberData] | null
  >(null);
  const closeDetailsMenu = () => {
    setDetailsMenu(null);
  };

  const oshiVtuber = getVtuber(oshi);

  return (
    <>
      <List dense sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {oshiVtuber ? (
          <React.Fragment key={oshiVtuber.id}>
            <VtuberListItem
              vtuber={oshiVtuber}
              selected={selected.has(oshiVtuber.id)}
              handleChange={handleChange}
              selectType={selectType}
              disabled={disabled}
              handleDetailsClick={(event) => {
                setDetailsMenu([event.currentTarget, oshiVtuber]);
              }}
            />
            <Divider
              variant="fullWidth"
              component="li"
              sx={{ borderBottomWidth: 'thick' }}
            />
          </React.Fragment>
        ) : null}

        {(vtubers as VtuberData[]).map((vtuber) => {
          if (vtuber.id === oshiVtuber?.id) {
            return null;
          }

          const isSelected = selected.has(vtuber.id) || false;
          return (
            <React.Fragment key={vtuber.id}>
              <VtuberListItem
                vtuber={vtuber}
                selected={isSelected}
                handleChange={handleChange}
                selectType={selectType}
                disabled={disabled}
                handleDetailsClick={(event) => {
                  setDetailsMenu([event.currentTarget, vtuber]);
                }}
              />
              <Divider variant="inset" component="li" />
            </React.Fragment>
          );
        })}
      </List>

      <Menu
        id="basic-menu"
        anchorEl={detailsMenu?.[0]}
        open={!!detailsMenu}
        onClose={closeDetailsMenu}
        MenuListProps={{ 'aria-labelledby': 'basic-button' }}
      >
        <MenuItem
          onClick={() => {
            window.open(
              `https://twitter.com/${detailsMenu?.[1].twitter}`,
              '_blank'
            );
            closeDetailsMenu();
          }}
        >
          Twitter
        </MenuItem>
        <MenuItem
          onClick={() => {
            window.open(
              `https://www.youtube.com/channel/${detailsMenu?.[1].id}`,
              '_blank'
            );
            closeDetailsMenu();
          }}
        >
          YouTube
        </MenuItem>
      </Menu>
    </>
  );
};

export default VtuberMenu;
