import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { TaskList } from '../components/helper/TaskList';

describe('TaskList (Helper)', () => {
  it('renders without crashing', () => {
    render(
      <TaskList
        tasks={[]}
        userId="1"
        onBidClick={() => {}}
        onWithdrawBid={() => {}}
        onStartTask={() => {}}
        onCompleteTask={() => {}}
      />
    );
  });
}); 