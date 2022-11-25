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

/**
 * Interface used as arguments for the check function containing the pattern,
 * error message and the messages.
 */
export interface ICheckerArguments {
  base: string
  head: string
  repo: string
  code: string
  pattern: string
  flags: string
  error: string
  onePassAllPass: string
  commitsString: string
  preErrorMsg: string
  postErrorMsg: string
  buildStatusURL: string
}

/**
 * Checks commit messages given by args.
 *
 * @param     args messages, pattern and error message to process.
 * @returns   string
 */
export function checkPullRequest(
  args: ICheckerArguments,
  sha: string,
  message: string
): string {
  core.info(`Checking Commit: ${sha} - ${message}`)

  if (checkMessage(message, args.pattern, args.flags)) {
    return ''
  } else {
    return `[${message}] ${args.error}`
  }
}

/**
 * Checks the message against the regex pattern.
 *
 * @param     message message to check against the pattern.
 * @param     pattern regex pattern for the check.
 * @returns   boolean
 */
export function checkMessage(
  message: string,
  pattern: string,
  flags: string
): boolean {
  const regex = new RegExp(pattern, flags)

  return regex.test(message)
}
