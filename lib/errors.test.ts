import { Errors } from './errors'

describe('errors', () => {
  test('example', () => {
    const errors = new Errors()
    expect(errors.noErrors()).toBe(true)
    errors.add('error1')
    errors.add('error2', 'error3')
    expect(errors.noErrors()).toBe(false)
    expect(errors.toString()).toBe('error1\nerror2\nerror3')
  })
})
