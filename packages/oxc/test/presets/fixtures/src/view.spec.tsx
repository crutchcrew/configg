import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
expect(1).toBe(1)
describe('view', () => {
	it.only('renders', () => {
		const { container } = render(<div>hi</div>)
		fireEvent.click(screen.getByText('hi'))
		expect(container.querySelector('div')).toBeTruthy()
	})
})
var legacy = 1
export { legacy }
export const n = null
