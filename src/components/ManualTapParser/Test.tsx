import { generateTAP } from "./Functions"
import { TestList, TestInformation } from "./Types";

export let testSuite: TestList<Test, 'major'> = {list:[],type:'major'};

export class Test {
    testInformation: TestInformation = {
        tap: 'not ok This test was never evaluated',
        type: 'major', 
        successState: 'failed', 
        description: 'There is no test description',
        line: 'not ok',
        location: 'This is a server error', 
        message: 'This test has not been correctly implemented',
        yaml: this.generateYaml('This is a server error', 'This test has not been correctly implemented'),
        subtests: {list: [], type: 'subtest'},
    };
    constructor(description: string, type?: 'subtest'){
        if (type === 'subtest') {
            this.testInformation.type = 'subtest'
        } else {
            testSuite.list.push(this);
        }
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
    fail(location: string = 'None provided', message: string = 'Maybe there was an issue with a subtest') {
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
        var subtest = new Test(description, 'subtest')
        this.testInformation.subtests.list.push(subtest)
        return subtest
    }
}