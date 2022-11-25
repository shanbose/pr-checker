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
import * as inputHelper from './input-helper'
import * as pullRequestChecker from './pull-request-checker'
import axios from 'axios'

/**
 * Main function
 */
async function run(): Promise<void> {
  const jenkinsURL =
    'https://oacis-jenkins-git-router.azurewebsites.net/buildresult'

  try {
    const checkerArguments = inputHelper.getInputs()
    const commits = JSON.parse(checkerArguments.commitsString)

    const failed = []

    for (const {commit, sha} of commits) {
      inputHelper.checkArgs(checkerArguments)

      const errMsg = pullRequestChecker.checkPullRequest(
        checkerArguments,
        sha,
        commit.message
      )

      if (errMsg) {
        failed.push({label: 'ERROR:', message: `${sha} - ${errMsg}`})
      }
    }

    const repo: string = checkerArguments.repo.split('/')[1]

    core.info(`Repo: ${checkerArguments.repo}`)
    core.info(`Head: ${checkerArguments.head}`)

    const rsp = await getBuildStatus(
      jenkinsURL,
      repo,
      checkerArguments.head,
      checkerArguments.code
    )

    if (rsp.isError) {
      failed.push({label: 'ERROR:', message: rsp.message})
    } else {
      core.info(`Response: ${JSON.stringify(rsp.data)}`)

      if (rsp.data.lastBuildSuccessStatus === false) {
        failed.push({
          label: 'ERROR:',
          message:
            'The head branch should have a recent successful deployment. Please tirgger a deployment in Jenkins and then re-run this job.'
        })
      }
    }

    if (
      checkerArguments.onePassAllPass === 'true' &&
      commits.length > failed.length
    ) {
      return
    }

    if (failed.length > 0) {
      const summary = inputHelper.genOutput(
        failed,
        checkerArguments.preErrorMsg,
        checkerArguments.postErrorMsg
      )

      core.setFailed(summary)
    }
  } catch (error) {
    core.error(error)

    core.setFailed(error.message)
  }
}

async function getBuildStatus(
  endpoint: string,
  repoName: string,
  headBranch: string,
  fcode: string
): Promise<any> {
  let ccode = ''

  for (let i = 0; i < fcode.length; i++) {
    ccode = ccode + fcode.charAt(i)
  }

  return await axios
    .get(endpoint, {
      params: {
        repo: repoName,
        branch: headBranch,
        code: ccode
      }
    })
    .catch(err => {
      return {isError: true, message: err.message}
    })
}

/**
 * Main entry point
 */
run()
