import Machinat, { MachinatNode } from '@machinat/core';
import { ACTION } from '../constant';
import ActionsCard from './ActionsCard';

type StopingCardProps = {
  children: MachinatNode;
};

const StopingCard = ({ children }: StopingCardProps) => {
  return (
    <ActionsCard
      actions={[
        { text: 'Yes', type: ACTION.OK },
        { text: 'No', type: ACTION.NO },
      ]}
    >
      {children}
    </ActionsCard>
  );
};

export default StopingCard;
