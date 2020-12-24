import {expect, test} from '@oclif/test'

describe('seal', () => {
  test
  .stdout()
  .command(['seal -h'])
  .it('runs seal', ctx => {
    expect(ctx.stdout).to.contain('seal world')
  })

  test
  .stdout()
  .command(['seal', '-g'])
  .it('runs seal -g', ctx => {
    expect(ctx.stdout).to.contain('seal jeff')
  })
})
