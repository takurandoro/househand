import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { TaskFilters } from '../components/helper/TaskFilters';

describe('TaskFilters', () => {
  it('renders without crashing', () => {
    render(
      <TaskFilters
        selectedHours={[]}
        selectedCategories={[]}
        onHoursChange={() => {}}
        onCategoryChange={() => {}}
      />
    );
  });
}); 