import { Test, TestSuite } from './Test';
import { TestList } from './Types';
import { Collapse, Card, Result, Typography, Progress} from 'antd';
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
                    details.push(<hr key={index+i}/>);
                    details.push(<p key={index+i}>Subtests evaluation: </p>);
                }
                let subtestInformation = subtest.testInformation;
                let code = <p style={{color:(subtestInformation.successState === 'failed' ? 'red':'green')}} key={index+i}> {'Subtest ' + (i+1) + ' ' + subtestInformation.successState + ': ' + subtestInformation.description} </p>
                details.push(code)
            });
            if (testInformation.successState === 'failed') {
                let errormessage =  [<Paragraph key={index+1}>
                                            <Collapse>
                                                <Panel key={index+1} header={`Test ${index+1} has failed`} extra={<CloseCircleOutlined/>}>
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