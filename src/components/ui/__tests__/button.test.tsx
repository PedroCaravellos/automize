import { describe, it, expect, vi } from 'vitest';
import { render, userEvent } from '@/test/utils';
import { Button } from '../button';

describe('Button', () => {
  it('deve renderizar corretamente', () => {
    const { getByText } = render(<Button>Click me</Button>);
    expect(getByText('Click me')).toBeInTheDocument();
  });

  it('deve chamar onClick quando clicado', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const { getByText } = render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('deve aplicar variante correta', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    expect(container.querySelector('button')?.className).toContain('destructive');
  });
});
