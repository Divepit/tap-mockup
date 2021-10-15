import { Test, TestSuite } from './Test';
import { Collapse, Card, Result, Typography, Progress, Divider} from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import '../../css/ManualTapParser.css'
import 'antd/dist/antd.css';

const { Panel } = Collapse;
const { Paragraph, Text } = Typography

export function generateTAP(testlist: TestSuite) {
    let indent: string = ''
    let tap: string = ''
    if (testlist.type === 'subtest') {        
        indent = '    '
        tap += '\n'
    }
    if (testlist.list.length === 0) {
        return ''
    } else {
        tap += indent + '1..'+testlist.list.length+'\n'
        testlist.list.forEach(test => {
            tap += indent + (test.testInformation.tap + '\n')
        })
    }    
    return tap;
}

export function generateJSON(testlist: TestSuite) {
    let jsons: Test[] = []
    testlist.list.forEach(test => {
        jsons.push(test)
    })
    return JSON.stringify(jsons);
}

export function generateHtml (testlist: TestSuite){
    let json = generateJSON(testlist)
    let parsedJson = JSON.parse(json);
    let testpanels: object[] = [];
    let errors: object[] = [];

    parsedJson.forEach( (test: Test, index: number) => {
        let details: object[] = [];
        let testInformation = test.testInformation;
        if (testInformation.type === 'major') {
            testInformation.subtests.list.forEach ((subtest: Test, i: number) => {
                if (details.length === 0) {
                    details.push(<Divider key={index+i}/>);
                    details.push(<p key={index+i}>Subtests evaluation: </p>);
                }
                let subtestInformation = subtest.testInformation;
                let code = <p style={{color:(subtestInformation.successState === 'failed' ? 'red':'green')}} key={index+i}> {'Subtest ' + (i+1) + ' ' + subtestInformation.successState + ': ' + subtestInformation.description} </p>
                details.push(code)
            });
            if (testInformation.successState === 'failed') {
                let errormessage =  [<Paragraph key={index+1}>
                                            <Collapse>
                                                <Panel key={index+1} header={`Test ${index+1} – ${testInformation.description} – has failed`} extra={<CloseCircleOutlined/>}>
                                                    <p>Location: {testInformation.location} </p>
                                                    <p>Message: {testInformation.message}</p>
                                                    {details}
                                                </Panel>
                                            </Collapse>
                                    </Paragraph>
                        ]
                        errors.push(errormessage)
            }   
        }
        let panel = <Panel  key={index+1} 
                            header={testInformation.description} 
                            style={testInformation.successState === 'successful' ? {background: '#ddffc4'} :  {background: '#ffc4c4'}} 
                            collapsible={details.length === 0 ? 'disabled' : 'header'}>
                                {details}
                            </Panel>
        testpanels.push(panel);
    })
    type Status = "error" | "success"

    let status: Status = "error"
    let errorlog;
    let progressbar;
    
    if (errors.length === 0) {
        status = "success"
    } else {
        errorlog = (
            <div className="desc">
                    <Paragraph>
                        <Text
                        strong
                        style={{
                            fontSize: 16,
                        }}
                        >
                        The following problems were found:
                        </Text>
                    </Paragraph>
                    {errors}
                </div>
        )
        
        progressbar = (
            <Progress percent={Math.floor((1-errors.length/testpanels.length)*100)} steps={testpanels.length} />
        )
    }

    return (
        <Card>
            <Result status={status}
                    title={`Evaluation ${errors.length === 0 ? '':'not'} successful`}
                    subTitle={`${errors.length} out of ${testpanels.length} tests ${errors.length === 1 ? 'has':'have'} failed`}
                    extra={progressbar}
            >
                {errorlog}
            </Result>
            
        </Card>
    )
}


export function generateHtmlFromTapString (tap: string, type?: 'pure') {
    type passObject = {
        index: number,
        line: string,
        subtests: string[]
    }
    type failObject = {
        index: number,
        line: string,
        subtests: string[],
        attributes: any
    }
    let amountOfTests: number = 0;
    let passed: passObject[] = [];
    let failed: failObject[] = [];
    let lines: string[] = tap.split("\n");
    let errors: object[] = [];
    let progressbar;

    lines.forEach ((line, index) => {
        lines[index] = line.replace(/\s/g, '\xa0')
    })

    if (type === 'pure') {
        let pureHtmlLines: object[] = [];
        lines.forEach((line,index) => {
            pureHtmlLines.push(<code key={index} className={'linedcode'}>{line}</code>)
         })
         return pureHtmlLines;
    }

    lines.forEach ((line, index) => {        
        if (line.substr(0,3) === '1..') {
            amountOfTests = parseInt(line.substr(3,line.length));
        }
        if (line.substr(0,2) === 'ok'){
            passed.push({index: index, line: line, subtests: []})
        }
        if (line.substr(0,3) === 'not') {
            failed.push({index: index, line: line, subtests: [], attributes: {}})
        }
    })
    
    passed.forEach (test => {
        let i = test.index+1;
        while (lines[i].substr(0,1) === '\xa0' || lines[i].substr(0,1) === '#') {
            if (lines[i].substr(4,2) === 'ok' || lines[i].substr(4,3) === 'not') {
                let line = lines[i].substr(4,lines[i].length)
                test.subtests.push(line);
            }
        i++
        }        
    })

    failed.forEach ((test, index) => {
        let i = test.index+1;
        let j = test.index+1;
        let testNumber = test.line.substr(7,1);
        let description = test.line.substr(11, test.line.length).replace('\xa0', ' ');     
                
        while (lines[i].substr(0,1) === '\xa0' || lines[i].substr(0,1) === '#') {
            if (lines[i].substr(4,2) === 'ok' || lines[i].substr(4,3) === 'not') {
                test.subtests.push(lines[i]);
            } else if (lines[j].substr(2,3) === '---') {
                j++;
                while (lines[j].substr(2,3) !== '...') {
                    test.attributes[lines[j].substr(2,lines[j].indexOf(':')-2)] = lines[j].substr(lines[j].indexOf(':')+2, lines[j].length);
                    j++;
                }
            }
        i++
        }
        let attributes = [];
        let details: object[] = [];

        for (const property in test.attributes) {
            test.attributes[property] = test.attributes[property].replace('\xa0', ' ')
            attributes.push(
                <p key={property}>{property}: {test.attributes[property]}</p>
            );
          }

        test.subtests.forEach ((subtest, index) => {
            if (details.length === 0) {
                details.push(<Divider key={index+i}/>);
                details.push(<p key={index+i}>Subtests evaluation: </p>);
            }
            subtest = subtest.replace('\xa0', ' ').trim();
            let color = subtest.substr(0,2) === 'ok' ?  'green' : 'red';
            details.push(
                <p style={{color: color}} key={index}> {subtest} </p>
            )
        })

        errors.push(
            <Paragraph key={index+1}>
                    <Collapse>
                        <Panel key={index+1} header={`Test ${testNumber} – ${description} – has failed`} extra={<CloseCircleOutlined/>}>
                            {attributes}
                            {details}
                        </Panel>
                    </Collapse>
            </Paragraph>
        )
        progressbar = (
            <Progress percent={Math.floor((1-errors.length/amountOfTests)*100)} steps={amountOfTests} />
        )
    })

    type Status = "error" | "success"
    let status: Status = "error"
    let errorlog;

    if (errors.length === 0) {
        status = 'success'
    } else {
        errorlog = (
            <div className="desc">
                    <Paragraph>
                        <Text
                        strong
                        style={{
                            fontSize: 16,
                        }}
                        >
                        The following problems were found:
                        </Text>
                    </Paragraph>
                    {errors}
                </div>
        )
    }
    return (
        <Card>
            <Result status={status}
                    title={`Evaluation ${errors.length === 0 ? '':'not'} successful`}
                    subTitle={`${errors.length} out of ${amountOfTests} tests ${errors.length === 1 ? 'has':'have'} failed`}
                    extra={progressbar}
            >
                {errorlog}
            </Result>
            
        </Card>
    )
}