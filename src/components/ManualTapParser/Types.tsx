import { Test, TestSuite } from "./Test"
export type TestList<Test, type> = 
    | {list: Array<Test>, type: 'major'}
    | {list: Array<Test>, type: 'subtest'}

type FailedTestInformation = { 
    tap: string,
    successState: 'failed', 
    description: string,
    line: 'not ok',
    location: string, 
    message: string,
    yaml: string,
    subtests: TestSuite,
}

type SuccessfulTestInformation = { 
    tap: string,
    successState: 'successful',
    description: string,
    line: 'ok',
    subtests: TestSuite
}

type FailedMajorTestInformation = {type: 'major'} & FailedTestInformation
type FailedSubtestInformation = {type: 'subtest'} & FailedTestInformation
type SuccessfulMajorTestInformation = {type: 'major'} & SuccessfulTestInformation
type SuccessfulSubtestInformation = {type: 'subtest'} & SuccessfulTestInformation

export type MajorTestInformation = 
    | SuccessfulMajorTestInformation
    | FailedMajorTestInformation

export type SubtestInformation = 
    | SuccessfulSubtestInformation
    | FailedSubtestInformation

export type TestInformation =
    | MajorTestInformation
    | SubtestInformation