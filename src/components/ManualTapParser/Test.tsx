import { generateTAP } from "./Functions"
import { TestList, TestInformation } from "./Types";

// export let testSuite: TestList<Test, 'major'> = {list:[],type:'major'};

export class TestSuite {
    list: Test[] = [];
    type:  'major' | 'subtest';

    constructor(type: 'major' | 'subtest') {
        this.type = type;
    }
}

export class Test {
    subtests = new TestSuite('subtest');
    testInformation: TestInformation = {
        tap: 'not ok This test was never evaluated',
        type: 'major', 
        successState: 'failed', 
        description: 'There is no test description',
        line: 'not ok',
        location: 'This is a server error', 
        message: 'This test has not been correctly implemented',
        yaml: this.generateYaml('This is a server error', 'This test has not been correctly implemented'),
        subtests: this.subtests,
    };
    constructor(testSuite: TestSuite, description: string, type?: 'subtest'){
        if (type === 'subtest') {
            this.testInformation.type = 'subtest'
        }
        testSuite.list.push(this);
        this.testInformation.description = description;
    }
    pass() {
        this.testInformation = {
            tap: 'ok ' +  this.testInformation.description,
            type: this.testInformation.type,
            successState: 'successful',
            description: this.testInformation.description,
            line: 'ok',
            subtests: this.testInformation.subtests,
        }
        if (this.testInformation.type === 'major'){
           this.testInformation.tap += generateTAP(this.testInformation.subtests)
        }
    }
    fail(location: string = 'None provided', message: string = 'None provided') {
        this.testInformation = {
            tap: 'not ok ' + this.testInformation.description,
            type: this.testInformation.type, 
            successState: 'failed', 
            description: this.testInformation.description,
            line: 'not ok',
            location: location, 
            message: message,
            yaml: this.generateYaml(location,message),
            subtests: this.testInformation.subtests
        }        
        if (this.testInformation.type === 'major'){
            this.testInformation.tap += this.generateYaml(location, message)
            this.testInformation.tap += '\n' + generateTAP(this.testInformation.subtests)
        }        
    }
    generateYaml(location: string, message: string){
        var yaml = '\n' +
            '    ---\n' +
            '    location: ' + location + '\n' +
            '    cause: ' + message + '\n' +
            '    ...';
        return yaml;
    }
    subtest(description: string){        
        var subtest = new Test(this.testInformation.subtests, description, 'subtest')
        return subtest
    }
}