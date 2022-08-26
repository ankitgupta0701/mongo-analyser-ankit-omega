import { connect } from "http2";
import { ResourceAssessment } from "../classes/resource-assessment.class"

export class ResourceAssessmentService {

    private connString: string;

    constructor(connectionString: string) {
        this.connString = connectionString;
    }

    public initialize() {
        let resource_assessment = new ResourceAssessment(this.connString);
        let assessment_result = resource_assessment.initiateAssessment();
    }

}