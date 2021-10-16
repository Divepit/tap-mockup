import { Test, TestSuite } from "./Test"
export type TestList<Test, type> = 
    | {list: Array<Test>, type: 'major'}
    | {list: Array<Test>, type: 'subtest'}

 export type FailedTestInformation = { 
    tap: string,
    successState: 'failed', 
    description: string,
    line: 'not ok',
    attributes: object,
    yaml: string,
}

export type SuccessfulTestInformation = { 
    tap: string,
    successState: 'successful',
    description: string,
    line: 'ok',
}

export type FailedMajorTestInformation = {type: 'major', subtests: TestSuite} & FailedTestInformation
export type FailedSubtestInformation = {type: 'subtest'} & FailedTestInformation
export type SuccessfulMajorTestInformation = {type: 'major', subtests: TestSuite} & SuccessfulTestInformation
export type SuccessfulSubtestInformation = {type: 'subtest'} & SuccessfulTestInformation

export type MajorTestInformation = 
    | SuccessfulMajorTestInformation
    | FailedMajorTestInformation

export type SubtestInformation = 
    | SuccessfulSubtestInformation
    | FailedSubtestInformation

export type TestInformation =
    | MajorTestInformation
    | SubtestInformation