/*
 * This file is part of the "GS Commit Message Checker" Action for Github.
 *
 * Copyright (C) 2019 by Gilbertsoft LLC (gilbertsoft.org)
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * For the full license information, please read the LICENSE file that
 * was distributed with this source code.
 */

/**
 * Imports
 */
import * as core from '@actions/core'
import {ICheckerArguments} from './pull-request-checker'

/**
 * Gets the inputs set by the user and the messages of the event.
 *
 * @returns   ICheckerArguments
 */
export function getInputs(): ICheckerArguments {
  const result = ({} as unknown) as ICheckerArguments

  result.base = core.getInput('base', {required: true})
  result.head = core.getInput('head', {required: true})
  result.repo = core.getInput('repo', {required: true})
  result.code = core.getInput('code', {required: true})
  result.pattern = '^ESP-[0-9]+\\s\\|\\s[a-zA-Z]+|^Merge\\spull'
  result.flags = core.getInput('flags')
  result.error =
    'Invalid commit message format. Allowed formats: ESP-NNN<space>|<space>Story summary / Merge<space>pull'
  result.onePassAllPass = core.getInput('one_pass_all_pass')
  result.commitsString = core.getInput('commits')
  result.preErrorMsg = core.getInput('pre_error')
  result.postErrorMsg = core.getInput('post_error')
  result.buildStatusURL = core.getInput('build_status_url')

  return result
}

export function checkArgs(args: ICheckerArguments): void {
  if (args.base.length === 0) {
    throw new Error(`BASE not defined.`)
  }

  if (args.head.length === 0) {
    throw new Error(`HEAD not defined.`)
  }

  if (args.repo.length === 0) {
    throw new Error(`REPO not defined.`)
  }

  if (args.code.length === 0) {
    throw new Error(`CODE not defined.`)
  }

  if (args.buildStatusURL.length === 0) {
    throw new Error(`BUID STATUS URL not defined.`)
  }

  const regex = new RegExp('[^gimsuy]', 'g')
  let invalidChars
  let chars = ''

  while ((invalidChars = regex.exec(args.flags)) !== null) {
    chars += invalidChars[0]
  }

  if (chars !== '') {
    throw new Error(`FLAGS contains invalid characters "${chars}".`)
  }
}

export function genOutput(
  commitInfos: any,
  preErrorMsg: string,
  postErrorMsg: string
): string {
  const lines = commitInfos.map(function(info: any) {
    return `${info.label}  ${info.message}`
  })

  const errors = `${lines.join('\n')}`

  return `${preErrorMsg}\n\n${errors}\n\n${postErrorMsg}`
}
